require "swagger_helper"

RSpec.describe "Api::V1::Me", type: :request do
  let(:user) { create(:user) }
  let(:authenticate) { sign_in(user) }

  before { authenticate }

  path "/api/v1/me" do
    get "現在のユーザー情報を取得する" do
      tags "Me"
      produces "application/json"

      response "200", "ユーザー情報" do
        schema "$ref" => "#/components/schemas/MeResponse"

        run_test! do |response|
          json = response.parsed_body
          expect(json["id"]).to eq(user.id)
          expect(json["email_address"]).to eq(user.email_address)
        end
      end

      response "401", "未認証" do
        schema "$ref" => "#/components/schemas/Error"
        let(:authenticate) { nil }

        run_test!
      end
    end
  end
end
