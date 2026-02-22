module AuthenticationHelper
  def sign_in(user = nil)
    user ||= create(:user)
    post api_v1_auth_session_path, params: { email_address: user.email_address, password: "password" }
    user
  end
end
