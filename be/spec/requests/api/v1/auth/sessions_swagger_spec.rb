require "swagger_helper"

RSpec.describe "Api::V1::Auth::Sessions", type: :request do
  path "/api/v1/auth/sign_in" do
    post "ログイン" do
      tags "Auth"
      consumes "application/json"
      produces "application/json"
      parameter name: :params, in: :body, schema: { "$ref" => "#/components/schemas/AuthInput" }

      response "201", "ログイン成功" do
        schema "$ref" => "#/components/schemas/AuthResponse"

        let(:user) { create(:user) }
        let(:params) { { email_address: user.email_address, password: "password" } }

        run_test! do |response|
          expect(response.parsed_body["email_address"]).to eq(user.email_address)
        end
      end

      response "401", "認証失敗" do
        schema "$ref" => "#/components/schemas/Error"

        let(:params) { { email_address: "nobody@example.com", password: "wrong" } }

        run_test! do |response|
          expect(response.parsed_body["error"]).to be_present
        end
      end
    end
  end

  path "/api/v1/auth/sign_out" do
    delete "ログアウト" do
      tags "Auth"

      response "204", "ログアウト成功" do
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
