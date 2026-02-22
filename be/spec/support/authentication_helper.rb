module AuthenticationHelper
  def sign_in(user = nil)
    user ||= create(:user)
    post api_v1_auth_sign_in_path, params: { email_address: user.email_address, password: "password" }
    user
  end
end
