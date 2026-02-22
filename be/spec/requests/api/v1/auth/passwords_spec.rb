require "rails_helper"

RSpec.describe "Api::V1::Auth::Passwords" do
  include ActiveSupport::Testing::TimeHelpers

  describe "POST /api/v1/auth/passwords" do
    context "with registered email" do
      let!(:user) { create(:user, email_address: "user@example.com") }

      it "returns ok with instruction message" do
        post api_v1_auth_passwords_path, params: { email_address: "user@example.com" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["message"]).to include("Password reset instructions sent")
      end

      it "enqueues a password reset email" do
        expect {
          post api_v1_auth_passwords_path, params: { email_address: "user@example.com" }
        }.to have_enqueued_mail(PasswordsMailer, :reset).with(user)
      end
    end

    context "with unregistered email" do
      it "returns ok with the same message (does not reveal user existence)" do
        post api_v1_auth_passwords_path, params: { email_address: "nobody@example.com" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["message"]).to include("Password reset instructions sent")
      end

      it "does not enqueue any email" do
        expect {
          post api_v1_auth_passwords_path, params: { email_address: "nobody@example.com" }
        }.not_to have_enqueued_mail(PasswordsMailer, :reset)
      end
    end
  end

  describe "PUT /api/v1/auth/passwords/:token" do
    let!(:user) { create(:user, password: "oldpassword", password_confirmation: "oldpassword") }

    context "with valid token and passwords" do
      it "resets the password" do
        token = user.password_reset_token

        put api_v1_auth_password_path(token: token), params: { password: "newpassword", password_confirmation: "newpassword" }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["message"]).to eq("Password has been reset.")
        expect(user.reload.authenticate("newpassword")).to eq(user)
      end

      it "destroys all existing sessions" do
        user.sessions.create!(user_agent: "test", ip_address: "127.0.0.1")
        user.sessions.create!(user_agent: "test2", ip_address: "127.0.0.2")
        token = user.password_reset_token

        expect {
          put api_v1_auth_password_path(token: token), params: { password: "newpassword", password_confirmation: "newpassword" }
        }.to change { user.sessions.count }.from(2).to(0)
      end
    end

    context "with mismatched password confirmation" do
      it "returns unprocessable entity" do
        token = user.password_reset_token

        put api_v1_auth_password_path(token: token), params: { password: "newpassword", password_confirmation: "different" }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body["errors"]).to include(a_string_matching(/Password confirmation/))
      end
    end

    context "with invalid token" do
      it "returns bad request" do
        put api_v1_auth_password_path(token: "invalid-token"), params: { password: "newpassword", password_confirmation: "newpassword" }

        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body["error"]).to include("invalid or has expired")
      end
    end

    context "with expired token" do
      it "returns bad request" do
        token = user.password_reset_token

        travel 16.minutes do
          put api_v1_auth_password_path(token: token), params: { password: "newpassword", password_confirmation: "newpassword" }

          expect(response).to have_http_status(:bad_request)
          expect(response.parsed_body["error"]).to include("invalid or has expired")
        end
      end
    end

    context "with token for a deleted user" do
      it "returns bad request" do
        token = user.password_reset_token
        user.destroy!

        put api_v1_auth_password_path(token: token), params: { password: "newpassword", password_confirmation: "newpassword" }

        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body["error"]).to include("invalid or has expired")
      end
    end

    context "with already-used token (password already changed)" do
      it "returns bad request" do
        token = user.password_reset_token
        user.update!(password: "changedpassword", password_confirmation: "changedpassword")

        put api_v1_auth_password_path(token: token), params: { password: "anotherpassword", password_confirmation: "anotherpassword" }

        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body["error"]).to include("invalid or has expired")
      end
    end
  end
end
