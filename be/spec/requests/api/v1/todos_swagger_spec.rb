require "swagger_helper"

RSpec.describe "Api::V1::Todos", type: :request do
  let(:user) { create(:user) }
  let(:authenticate) { sign_in(user) }

  before { authenticate }

  path "/api/v1/todos" do
    get "Todo一覧を取得する" do
      tags "Todos"
      produces "application/json"

      response "200", "Todo一覧" do
        schema type: :array, items: { "$ref" => "#/components/schemas/Todo" }

        before { create_list(:todo, 3, user: user) }

        run_test! do |response|
          expect(response.parsed_body.size).to eq(3)
        end
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }

        run_test!
      end
    end

    post "Todoを作成する" do
      tags "Todos"
      consumes "application/json"
      produces "application/json"
      parameter name: :params, in: :body, schema: { "$ref" => "#/components/schemas/TodoInput" }

      response "201", "作成成功" do
        schema "$ref" => "#/components/schemas/Todo"
        let(:params) { { todo: { text: "New todo" } } }

        run_test! do |response|
          json = response.parsed_body
          expect(json["text"]).to eq("New todo")
          expect(json["completed"]).to be false
        end
      end

      response "422", "バリデーションエラー" do
        schema "$ref" => "#/components/schemas/Errors"

        let(:params) { { todo: { text: "" } } }

        run_test! do |response|
          expect(response.parsed_body).to have_key("errors")
        end
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }
        let(:params) { { todo: { text: "Test" } } }

        run_test!
      end
    end
  end

  path "/api/v1/todos/bulk_destroy" do
    delete "Todoを一括削除する" do
      tags "Todos"
      consumes "application/json"
      parameter name: :params, in: :body, schema: { "$ref" => "#/components/schemas/BulkDeleteInput" }

      response "204", "一括削除成功" do
        let(:params) { { ids: create_list(:todo, 3, user: user).map(&:id) } }

        run_test!
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }
        let(:params) { { ids: [ 1, 2, 3 ] } }

        run_test!
      end
    end
  end

  path "/api/v1/todos/{id}" do
    parameter name: :id, in: :path, type: :integer, description: "Todo ID"

    patch "Todoを更新する" do
      tags "Todos"
      consumes "application/json"
      produces "application/json"
      parameter name: :params, in: :body, schema: { "$ref" => "#/components/schemas/TodoInput" }

      response "200", "更新成功" do
        schema "$ref" => "#/components/schemas/Todo"
        let(:todo) { create(:todo, user: user) }
        let(:id) { todo.id }
        let(:params) { { todo: { completed: true } } }

        run_test! do |response|
          expect(response.parsed_body["completed"]).to be true
        end
      end

      response "422", "バリデーションエラー" do
        schema "$ref" => "#/components/schemas/Errors"

        let(:todo) { create(:todo, user: user) }
        let(:id) { todo.id }
        let(:params) { { todo: { text: "" } } }

        run_test! do |response|
          expect(response.parsed_body).to have_key("errors")
        end
      end

      response "404", "Not Found" do
        let(:id) { 999999 }
        let(:params) { { todo: { completed: true } } }

        run_test!
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }
        let(:id) { create(:todo).id }
        let(:params) { { todo: { completed: true } } }

        run_test!
      end
    end

    delete "Todoを削除する" do
      tags "Todos"

      response "204", "削除成功" do
        let(:todo) { create(:todo, user: user) }
        let(:id) { todo.id }

        run_test!
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }
        let(:id) { create(:todo).id }

        run_test!
      end
    end
  end
end
