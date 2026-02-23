module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_authentication
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end
  end

  private
    def authenticated?
      resume_session
    end

    def require_authentication
      resume_session || request_authentication
    end

    def resume_session
      Current.session ||= find_session_by_cookie
    end

    def find_session_by_cookie
      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
    end

    def request_authentication
      render json: { error: "Authentication required" }, status: :unauthorized
    end

    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
        cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, **session_cookie_options }
      end
    end

    def terminate_session
      Current.session.destroy
      cookies.delete(:session_id, **session_cookie_options)
    end

    def session_cookie_options
      if (domain = ENV["SESSION_COOKIE_DOMAIN"])
        { same_site: :lax, secure: true, domain: domain }
      else
        { same_site: :lax }
      end
    end
end
