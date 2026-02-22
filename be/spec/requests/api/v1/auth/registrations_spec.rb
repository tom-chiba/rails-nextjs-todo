require "rails_helper"

RSpec.describe "Api::V1::Auth::Registrations" do
  describe "POST /api/v1/auth/sign_up" do
    let(:valid_params) do
      { email_address: "newuser@example.com", password: "password", password_confirmation: "password" }
    end

    context "with valid params" do
      it "creates a new user" do
        expect {
          post api_v1_auth_sign_up_path, params: valid_params
        }.to change(User, :count).by(1)
      end

      it "returns created status with email_address" do
        post api_v1_auth_sign_up_path, params: valid_params

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["email_address"]).to eq("newuser@example.com")
      end

      it "creates a session for the new user" do
        expect {
          post api_v1_auth_sign_up_path, params: valid_params
        }.to change(Session, :count).by(1)
      end

      it "sets the session cookie" do
        post api_v1_auth_sign_up_path, params: valid_params

        expect(cookies[:session_id]).to be_present
      end
    end

    context "with missing email_address" do
      it "returns unprocessable_entity" do
        post api_v1_auth_sign_up_path, params: { password: "password", password_confirmation: "password" }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["errors"]).to include(a_string_matching(/Email address/))
      end
    end

    context "with duplicate email_address" do
      before { create(:user, email_address: "existing@example.com") }

      it "returns unprocessable_entity" do
        post api_v1_auth_sign_up_path, params: { email_address: "existing@example.com", password: "password", password_confirmation: "password" }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["errors"]).to include(a_string_matching(/Email address/))
      end
    end

    context "with mismatched password_confirmation" do
      it "returns unprocessable_entity" do
        post api_v1_auth_sign_up_path, params: { email_address: "newuser@example.com", password: "password", password_confirmation: "different" }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["errors"]).to include(a_string_matching(/Password confirmation/))
      end
    end

    context "with missing password" do
      it "returns unprocessable_entity" do
        post api_v1_auth_sign_up_path, params: { email_address: "newuser@example.com" }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["errors"]).to include(a_string_matching(/Password/))
      end
    end
  end
end
