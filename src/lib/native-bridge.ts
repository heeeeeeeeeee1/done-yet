/**
 * 웹뷰에서 Expo 네이티브 앱으로 메시지를 보내는 유틸리티
 */

// ReactNativeWebView 타입 선언 (전역 window 객체 확장을 위해)
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    // 앱에서 주입할 수 있는 전역 함수
    setPushToken?: (token: string) => void;
  }
}

export const sendToNative = (type: string, data?: any) => {
  if (typeof window !== 'undefined' && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
  }
};

/**
 * 강력한 진동 (앱 측에서 VIBRATE_STRONG 타입을 수신하면 실행)
 */
export const triggerStrongVibration = () => {
  sendToNative('VIBRATE_STRONG');
};

/**
 * 일반 피드백 진동
 */
export const triggerFeedbackVibration = () => {
  sendToNative('VIBRATE_FEEDBACK');
};
