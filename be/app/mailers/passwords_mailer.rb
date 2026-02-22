class PasswordsMailer < ApplicationMailer
  def reset(user)
    @user = user
    @reset_url = "#{ENV.fetch("FRONTEND_URL", "http://localhost:3001")}/auth/reset-password?token=#{@user.password_reset_token}"
    mail subject: "Reset your password", to: user.email_address
  end
end
