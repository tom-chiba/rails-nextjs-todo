require "rails_helper"

RSpec.describe "Api::V1::Auth::Sessions" do
  describe "POST /api/v1/auth/sign_in" do
    let(:user) { create(:user) }

    context "with valid credentials" do
      it "returns created status with email_address" do
        post api_v1_auth_sign_in_path, params: { email_address: user.email_address, password: "password" }

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["email_address"]).to eq(user.email_address)
      end

      it "creates a session" do
        expect {
          post api_v1_auth_sign_in_path, params: { email_address: user.email_address, password: "password" }
        }.to change(Session, :count).by(1)
      end

      it "sets the session cookie" do
        post api_v1_auth_sign_in_path, params: { email_address: user.email_address, password: "password" }

        expect(cookies[:session_id]).to be_present
      end
    end

    context "with invalid password" do
      it "returns unauthorized" do
        post api_v1_auth_sign_in_path, params: { email_address: user.email_address, password: "wrong" }

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["error"]).to eq("Invalid email address or password")
      end

      it "does not create a session" do
        expect {
          post api_v1_auth_sign_in_path, params: { email_address: user.email_address, password: "wrong" }
        }.not_to change(Session, :count)
      end
    end

    context "with nonexistent email" do
      it "returns unauthorized" do
        post api_v1_auth_sign_in_path, params: { email_address: "nobody@example.com", password: "password" }

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["error"]).to eq("Invalid email address or password")
      end
    end
  end

  describe "DELETE /api/v1/auth/sign_out" do
    context "when authenticated" do
      let(:user) { create(:user) }

      before { sign_in(user) }

      it "returns no_content" do
        delete api_v1_auth_sign_out_path

        expect(response).to have_http_status(:no_content)
      end

      it "destroys the session" do
        expect {
          delete api_v1_auth_sign_out_path
        }.to change(Session, :count).by(-1)
      end

      it "clears the session cookie" do
        delete api_v1_auth_sign_out_path

        expect(cookies[:session_id]).to be_blank
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        delete api_v1_auth_sign_out_path

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["error"]).to eq("Authentication required")
      end
    end
  end
end
