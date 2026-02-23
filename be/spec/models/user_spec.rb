require 'rails_helper'

RSpec.describe User, type: :model do
  describe "associations" do
    it "has many sessions" do
      user = create(:user)
      session = user.sessions.create!(user_agent: "test", ip_address: "127.0.0.1")
      expect(user.sessions).to include(session)
    end

    it "destroys associated sessions when destroyed" do
      user = create(:user)
      user.sessions.create!(user_agent: "test", ip_address: "127.0.0.1")
      expect { user.destroy }.to change(Session, :count).by(-1)
    end

    it "has many todos" do
      user = create(:user)
      todo = create(:todo, user: user)
      expect(user.todos).to include(todo)
    end

    it "destroys associated todos when destroyed" do
      user = create(:user)
      create(:todo, user: user)
      expect { user.destroy }.to change(Todo, :count).by(-1)
    end
  end

  describe "validations" do
    it "is valid with valid attributes" do
      expect(build(:user)).to be_valid
    end

    it "is invalid without email_address" do
      user = build(:user, email_address: nil)
      expect(user).not_to be_valid
      expect(user.errors[:email_address]).to be_present
    end

    it "is invalid with duplicate email_address" do
      create(:user, email_address: "dup@example.com")
      user = build(:user, email_address: "dup@example.com")
      expect(user).not_to be_valid
      expect(user.errors[:email_address]).to be_present
    end

    it "is invalid with duplicate email_address (case insensitive)" do
      create(:user, email_address: "test@example.com")
      user = build(:user, email_address: "TEST@EXAMPLE.COM")
      expect(user).not_to be_valid
    end

    context "email format" do
      it "accepts valid email addresses" do
        %w[user@example.com USER@example.com user+tag@example.com user@sub.example.com].each do |email|
          user = build(:user, email_address: email)
          expect(user).to be_valid, "#{email} should be valid"
        end
      end

      it "rejects invalid email addresses" do
        %w[invalid not-an-email @example.com user@].each do |email|
          user = build(:user, email_address: email)
          expect(user).not_to be_valid, "#{email} should be invalid"
        end
      end
    end
  end

  describe "normalization" do
    it "strips and downcases email_address" do
      user = create(:user, email_address: "  USER@EXAMPLE.COM  ")
      expect(user.email_address).to eq("user@example.com")
    end
  end

  describe "has_secure_password" do
    it "authenticates with correct password" do
      user = create(:user, password: "secure123", password_confirmation: "secure123")
      expect(user.authenticate("secure123")).to eq(user)
    end

    it "does not authenticate with incorrect password" do
      user = create(:user, password: "secure123", password_confirmation: "secure123")
      expect(user.authenticate("wrong")).to be_falsey
    end
  end

  describe "password reset token" do
    let(:user) { create(:user) }

    it "generates a password reset token" do
      token = user.password_reset_token
      expect(token).to be_present
      expect(token).to be_a(String)
    end

    it "finds a user by valid password reset token" do
      token = user.password_reset_token
      found = User.find_by_password_reset_token(token)
      expect(found).to eq(user)
    end

    it "returns nil for an invalid token" do
      found = User.find_by_password_reset_token("invalid-token")
      expect(found).to be_nil
    end

    it "invalidates token after password change" do
      token = user.password_reset_token
      user.update!(password: "newpassword", password_confirmation: "newpassword")
      found = User.find_by_password_reset_token(token)
      expect(found).to be_nil
    end

    it "reports the token expiration duration" do
      expect(user.password_reset_token_expires_in).to eq(15.minutes)
    end
  end
end
