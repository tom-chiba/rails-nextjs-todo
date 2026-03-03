require "swagger_helper"

RSpec.describe "Api::V1::Auth::Registrations", type: :request do
  path "/api/v1/auth/sign_up" do
    post "ユーザー登録" do
      tags "Auth"
      consumes "application/json"
      produces "application/json"
      parameter name: :params, in: :body, schema: { "$ref" => "#/components/schemas/RegistrationInput" }

      response "201", "登録成功" do
        schema "$ref" => "#/components/schemas/AuthResponse"

        let(:params) { { email_address: "newuser@example.com", password: "password", password_confirmation: "password" } }

        run_test! do |response|
          expect(response.parsed_body["email_address"]).to eq("newuser@example.com")
        end
      end

      response "422", "バリデーションエラー" do
        schema "$ref" => "#/components/schemas/ValidationErrors"

        let(:params) { { email_address: "", password: "password", password_confirmation: "password" } }

        run_test! do |response|
          expect(response.parsed_body["errors"]).to be_present
        end
      end
    end
  end

  path "/api/v1/auth/account" do
    delete "アカウント削除" do
      tags "Auth"

      response "204", "アカウント削除成功" do
        before { sign_in }
        run_test!
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        run_test!
      end
    end
  end
end
