class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt&.last(10)
  end

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true,
                            uniqueness: true,
                            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password_confirmation, presence: true, if: -> { password.present? }
end
