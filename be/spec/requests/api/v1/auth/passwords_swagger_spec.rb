require "swagger_helper"

RSpec.describe "Api::V1::Auth::Passwords", type: :request do
  path "/api/v1/auth/passwords" do
    post "パスワードリセットメール送信" do
      tags "Auth"
      consumes "application/json"
      produces "application/json"
      parameter name: :params, in: :body, schema: { "$ref" => "#/components/schemas/PasswordResetRequestInput" }

      response "200", "送信完了" do
        schema "$ref" => "#/components/schemas/MessageResponse"

        let!(:user) { create(:user, email_address: "user@example.com") }
        let(:params) { { email_address: "user@example.com" } }

        run_test! do |response|
          expect(response.parsed_body["message"]).to include("Password reset instructions sent")
        end
      end
    end
  end

  path "/api/v1/auth/passwords/{token}" do
    parameter name: :token, in: :path, type: :string, description: "パスワードリセットトークン"

    put "パスワードリセット実行" do
      tags "Auth"
      consumes "application/json"
      produces "application/json"
      parameter name: :params, in: :body, schema: { "$ref" => "#/components/schemas/PasswordResetInput" }

      response "200", "リセット成功" do
        schema "$ref" => "#/components/schemas/MessageResponse"

        let(:user) { create(:user) }
        let(:token) { user.password_reset_token }
        let(:params) { { password: "newpassword", password_confirmation: "newpassword" } }

        run_test! do |response|
          expect(response.parsed_body["message"]).to eq("Password has been reset.")
        end
      end

      response "400", "無効なトークン" do
        schema "$ref" => "#/components/schemas/Error"

        let(:token) { "invalid-token" }
        let(:params) { { password: "newpassword", password_confirmation: "newpassword" } }

        run_test! do |response|
          expect(response.parsed_body["error"]).to include("invalid or has expired")
        end
      end

      response "422", "バリデーションエラー" do
        schema "$ref" => "#/components/schemas/ValidationErrors"

        let(:user) { create(:user) }
        let(:token) { user.password_reset_token }
        let(:params) { { password: "newpassword", password_confirmation: "different" } }

        run_test! do |response|
          expect(response.parsed_body["errors"]).to be_present
        end
      end
    end
  end
end
