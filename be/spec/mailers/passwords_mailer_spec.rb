require "rails_helper"

RSpec.describe PasswordsMailer do
  describe "#reset" do
    let(:user) { create(:user, email_address: "user@example.com") }
    let(:mail) { described_class.reset(user) }

    it "sends to the user's email address" do
      expect(mail.to).to eq([ "user@example.com" ])
    end

    it "sets the subject" do
      expect(mail.subject).to eq("Reset your password")
    end

    it "sends from the default from address" do
      expect(mail.from).to eq([ "from@example.com" ])
    end

    it "includes the reset URL with token in the body" do
      expect(mail.body.encoded).to include("token=")
      expect(mail.body.encoded).to include("/reset-password")
    end

    it "includes the expiration notice" do
      expect(mail.body.encoded).to include("expire")
    end

    it "uses the FRONTEND_URL environment variable" do
      original = ENV["FRONTEND_URL"]
      ENV["FRONTEND_URL"] = "https://myapp.example.com"
      env_mail = described_class.reset(user)
      expect(env_mail.body.encoded).to include("https://myapp.example.com/reset-password")
    ensure
      ENV["FRONTEND_URL"] = original
    end
  end
end
