# rswag が生成する OpenAPI 2.0 形式の "type: file" を
# OpenAPI 3.0 準拠の multipart/form-data スキーマに変換する
namespace :swagger do
  task fix_file_types: :environment do
    swagger_root = Rails.root.join("swagger")
    Dir.glob(swagger_root.join("**/*.yaml")).each do |file_path|
      content = File.read(file_path)
      next unless content.include?("type: file")

      yaml = YAML.safe_load(content, permitted_classes: [ Symbol ])
      yaml["paths"]&.each_value do |path_item|
        path_item.each_value do |operation|
          next unless operation.is_a?(Hash) && operation["requestBody"]

          operation["requestBody"]["content"]&.each_value do |media_type|
            schema = media_type["schema"]
            next unless schema.is_a?(Hash) && schema["type"] == "file"

            media_type["schema"] = {
              "type" => "object",
              "properties" => {
                "image" => { "type" => "string", "format" => "binary" }
              },
              "required" => [ "image" ]
            }
          end
        end
      end
      File.write(file_path, yaml.to_yaml)
      puts "Fixed OpenAPI file types in #{file_path}"
    end
  end
end

# rswag:specs:swaggerize の後に自動で fix_file_types を実行
Rake::Task["rswag:specs:swaggerize"].enhance do
  Rake::Task["swagger:fix_file_types"].invoke
end
