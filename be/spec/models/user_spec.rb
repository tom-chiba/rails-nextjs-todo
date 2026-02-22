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
      user = create(:user, password: "secure123")
      expect(user.authenticate("secure123")).to eq(user)
    end

    it "does not authenticate with incorrect password" do
      user = create(:user, password: "secure123")
      expect(user.authenticate("wrong")).to be_falsey
    end
  end
end
