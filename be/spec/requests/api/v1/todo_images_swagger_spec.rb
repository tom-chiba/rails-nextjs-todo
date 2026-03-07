require "swagger_helper"

RSpec.describe "Api::V1::TodoImages", type: :request do
  let(:user) { create(:user) }
  let(:authenticate) { sign_in(user) }

  before { authenticate }

  path "/api/v1/todos/{todo_id}/image" do
    parameter name: :todo_id, in: :path, type: :integer, description: "Todo ID"

    post "Todoに画像をアップロードする" do
      tags "Todo Images"
      operationId "postApiV1TodosTodoIdImage"
      consumes "multipart/form-data"
      produces "application/json"
      parameter name: :image, in: :formData, type: :file, required: true, description: "画像ファイル (JPEG, PNG, GIF, WebP / 最大5MB)"

      response "200", "アップロード成功" do
        schema "$ref" => "#/components/schemas/Todo"
        let(:todo) { create(:todo, user: user) }
        let(:todo_id) { todo.id }
        let(:image) { fixture_file_upload("test.jpg", "image/jpeg") }

        run_test! do |response|
          expect(response.parsed_body["image_url"]).to be_present
        end
      end

      response "422", "バリデーションエラー" do
        schema "$ref" => "#/components/schemas/Errors"
        let(:todo) { create(:todo, user: user) }
        let(:todo_id) { todo.id }
        let(:image) { fixture_file_upload("test.txt", "text/plain") }

        run_test! do |response|
          expect(response.parsed_body).to have_key("errors")
        end
      end

      response "404", "Todo Not Found" do
        let(:todo_id) { 999999 }
        let(:image) { fixture_file_upload("test.jpg", "image/jpeg") }

        run_test!
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }
        let(:todo_id) { create(:todo).id }
        let(:image) { fixture_file_upload("test.jpg", "image/jpeg") }

        run_test!
      end
    end

    delete "Todoの画像を削除する" do
      tags "Todo Images"
      produces "application/json"

      response "200", "削除成功" do
        schema "$ref" => "#/components/schemas/Todo"
        let(:todo) { create(:todo, user: user) }
        let(:todo_id) { todo.id }

        before do
          todo.image.attach(
            io: StringIO.new("image data"),
            filename: "test.jpg",
            content_type: "image/jpeg"
          )
        end

        run_test! do |response|
          expect(response.parsed_body["image_url"]).to be_nil
        end
      end

      response "404", "画像なし or Todo Not Found" do
        let(:todo) { create(:todo, user: user) }
        let(:todo_id) { todo.id }

        run_test!
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }
        let(:todo_id) { create(:todo).id }

        run_test!
      end
    end
  end
end
