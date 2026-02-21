module AuthenticationHelper
  def sign_in(user = nil)
    user ||= create(:user)
    post session_path, params: { email_address: user.email_address, password: "password" }
    user
  end
end
