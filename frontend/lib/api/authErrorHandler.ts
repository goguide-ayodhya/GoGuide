/**
 * Global authentication error handler
 * Detects JWT token expiration and invalid token errors,
 * then triggers automatic logout and redirect to login page.
 */

/**
 * Check if an error response is an authentication error
 * (401 Unauthorized, 403 Forbidden, invalid/expired token)
 */
export function isAuthError(
  statusCode?: number,
  message?: string,
  response?: any
): boolean {
  // Check HTTP status codes
  if (statusCode === 401 || statusCode === 403) {
    return true;
  }

  // Check error message for common auth failure messages
  const messageStr = (message || response?.message || "").toLowerCase();
  const authErrorPatterns = [
    "invalid token",
    "expired token",
    "invalid or expired",
    "unauthorized",
    "jwt expired",
    "jwt malformed",
    "no token provided",
    "missing token",
    "missing authorization",
    "session expired",
  ];

  return authErrorPatterns.some((pattern) => messageStr.includes(pattern));
}

/**
 * Handle authentication error by clearing auth state and redirecting to login
 * This function is called whenever an API returns an auth error
 */
export function handleAuthError(error?: any): void {
  console.error("[AUTH_ERROR_HANDLER] Authentication error detected:", error);

  // Clear all authentication data from localStorage
  console.log("[AUTH_ERROR_HANDLER] Clearing authentication data from localStorage");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("signupRole");
  localStorage.removeItem("signupProgress");
  localStorage.removeItem("driver-signup-draft");
  localStorage.removeItem("guide-signup-draft");

  // Determine specific account status for better user messaging
  let title = "Session Expired";
  let description = "Your session has expired. Please log in again.";
  let variant = "destructive" as const;
  
  const message = error?.message || "";
  if (message.includes("blocked")) {
    title = "Account Blocked";
    description = "Your account has been blocked. Please contact support.";
  } else if (message.includes("suspended")) {
    title = "Account Suspended";
    description = "Your account has been suspended. Please contact support.";
  } else if (message.includes("deleted")) {
    title = "Account Deleted";
    description = "Your account has been deleted. Contact support if this is a mistake.";
  }

  // Show specific toast message for account status
  if (typeof window !== "undefined" && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        title,
        description,
        variant
      }
    }));
  }

  // Dispatch custom event to notify AuthContext and other listeners
  // This allows components to react to auth expiration without direct coupling
  if (typeof window !== "undefined" && window.dispatchEvent) {
    console.log("[AUTH_ERROR_HANDLER] Dispatching authExpired event");
    window.dispatchEvent(
      new CustomEvent("authExpired", {
        detail: {
          message: error?.message || "Your session has expired",
          reason: message.includes("blocked") ? "account_blocked" : 
                  message.includes("suspended") ? "account_suspended" : 
                  message.includes("deleted") ? "account_deleted" : 
                  "token_invalid_or_expired",
        },
      })
    );
  }

  // Redirect to login page
  // We use a setTimeout to ensure localStorage is cleared before navigation
  if (typeof window !== "undefined") {
    setTimeout(() => {
      console.log("[AUTH_ERROR_HANDLER] Redirecting to /login");
      window.location.href = "/login";
    }, 100);
  }
}

/**
 * Parse API response and handle authentication errors
 * This function extracts the message and status from various error formats
 */
export function parseAuthErrorInfo(
  statusCode?: number,
  jsonResponse?: any,
  errorMessage?: string
): { statusCode?: number; message: string } {
  const statusCodeToUse = statusCode;
  const message =
    jsonResponse?.message ||
    errorMessage ||
    `API Error (${statusCode || "unknown"})`;

  return {
    statusCode: statusCodeToUse,
    message,
  };
}

/**
 * Central error response handler that checks for auth errors
 * Combines response parsing, auth error detection, and cleanup in one place
 *
 * @param res - Fetch Response object
 * @param options - Configuration options
 * @returns Parsed response data or throws error
 *
 * Usage:
 * ```ts
 * const res = await fetch(url, options);
 * const data = await handleApiResponse(res);
 * ```
 */
export async function handleApiResponse(
  res: Response,
  options: {
    allowEmpty?: boolean;
    parseAsText?: boolean;
  } = {}
): Promise<any> {
  const { allowEmpty = false, parseAsText = false } = options;

  // Parse response body
  let jsonResponse: any = {};
  let responseText = "";

  try {
    responseText = await res.text();

    if (responseText) {
      if (parseAsText) {
        return responseText;
      }
      try {
        jsonResponse = JSON.parse(responseText);
      } catch {
        // If JSON parsing fails, treat as plain text error
        jsonResponse = { message: responseText };
      }
    } else if (!allowEmpty) {
      jsonResponse = { message: "Empty response from server" };
    }
  } catch (parseError) {
    console.error("[API_RESPONSE] Error parsing response:", parseError);
  }

  // Check for HTTP errors
  if (!res.ok) {
    const errorInfo = parseAuthErrorInfo(
      res.status,
      jsonResponse,
      res.statusText
    );

    // Log the error for debugging
    console.error("[API_RESPONSE] HTTP Error:", {
      status: res.status,
      statusText: res.statusText,
      message: errorInfo.message,
      fullResponse: jsonResponse,
    });

    // Check if this is an auth error and handle accordingly
    if (isAuthError(res.status, errorInfo.message, jsonResponse)) {
      console.warn("[API_RESPONSE] Authentication error detected, triggering logout");
      handleAuthError(errorInfo);
      // Throw error so calling code knows request failed
      throw new Error(errorInfo.message);
    }

    // For non-auth errors, throw with full context
    const error = new Error(errorInfo.message);
    (error as any).statusCode = res.status;
    (error as any).errors = jsonResponse.errors;
    throw error;
  }

  // Success response
  return jsonResponse.data || jsonResponse;
}
