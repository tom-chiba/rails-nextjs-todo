require "rails_helper"

RSpec.describe "Api::V1::Me" do
  let(:user) { create(:user) }

  describe "GET /api/v1/me" do
    context "when authenticated" do
      before { sign_in(user) }

      it "returns the current user's id and email_address" do
        get api_v1_me_path
        expect(response).to have_http_status(:ok)

        json = response.parsed_body
        expect(json["id"]).to eq(user.id)
        expect(json["email_address"]).to eq(user.email_address)
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        get api_v1_me_path
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
