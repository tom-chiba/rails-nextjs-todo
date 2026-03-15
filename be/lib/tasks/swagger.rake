# rswag が生成する OpenAPI 2.0 形式の formData パラメータを
# OpenAPI 3.0 準拠の multipart/form-data スキーマに変換する
#
# rswag 2.x は formData パラメータを正しく OpenAPI 3.0 に変換できない:
# - 単一の file パラメータ → schema が `type: file` になる (OpenAPI 2.0 形式)
# - 複数の formData パラメータ → 最初のパラメータの情報のみ残り他が消失
#
# この Rake タスクで正しい OpenAPI 3.0 multipart スキーマに置換する。
# 詳細: ADR-0023
namespace :swagger do
  # rswag spec の formData パラメータ定義から正しい OpenAPI 3.0 スキーマを構築する。
  # キー: "METHOD /path", 値: { properties: { ... }, required: [...] }
  # TODO: rswag が OpenAPI 3.0 の multipart/form-data を正しく生成できるようになったら、
  #       このタスク全体を削除する。
  MULTIPART_SCHEMAS = {
    "post /api/v1/todos" => {
      "type" => "object",
      "properties" => {
        "todo[text]" => { "type" => "string", "description" => "Todoテキスト" },
        "todo[completed]" => { "type" => "boolean", "description" => "完了フラグ" },
        "image" => { "type" => "string", "format" => "binary", "description" => "画像ファイル (JPEG, PNG, GIF, WebP / 最大5MB)" }
      },
      "required" => [ "todo[text]" ]
    }
  }.freeze

  task fix_file_types: :environment do
    swagger_root = Rails.root.join("swagger")
    Dir.glob(swagger_root.join("**/*.yaml")).each do |file_path|
      yaml = YAML.safe_load(File.read(file_path), permitted_classes: [ Symbol ])
      changed = false

      yaml["paths"]&.each do |path, path_item|
        path_item.each do |method, operation|
          next unless operation.is_a?(Hash) && operation["requestBody"]

          multipart = operation.dig("requestBody", "content", "multipart/form-data")
          next unless multipart

          key = "#{method} #{path}"
          schema = MULTIPART_SCHEMAS[key]
          next unless schema

          multipart["schema"] = schema
          operation["requestBody"].delete("required")
          operation["requestBody"].delete("description")
          changed = true
        end
      end

      if changed
        File.write(file_path, yaml.to_yaml)
        puts "Fixed OpenAPI multipart schemas in #{file_path}"
      end
    end
  end
end

# rswag:specs:swaggerize の後に自動で fix_file_types を実行
Rake::Task["rswag:specs:swaggerize"].enhance do
  Rake::Task["swagger:fix_file_types"].invoke
end
