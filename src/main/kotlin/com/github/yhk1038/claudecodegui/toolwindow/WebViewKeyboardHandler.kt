package com.github.yhk1038.claudecodegui.toolwindow

import org.cef.browser.CefBrowser
import org.cef.handler.CefKeyboardHandler
import org.cef.handler.CefKeyboardHandlerAdapter
import org.cef.misc.BoolRef
import java.awt.event.KeyEvent

/**
 * WebView 키보드 핸들러
 *
 * 특정 키 조합이 IDE에 의해 가로채지지 않도록
 * is_keyboard_shortcut을 false로 설정하여 WebView로 키 이벤트를 전달합니다.
 *
 * 처리하는 단축키:
 * - macOS: Cmd+Arrow, Option+Arrow (텍스트 내비게이션)
 * - macOS: Cmd+, (설정 열기 - IntelliJ Settings 다이얼로그 방지)
 * - Windows/Linux: Ctrl+, (설정 열기)
 * - F12: DevTools 열기
 *
 * @param onOpenDevTools F12 키 입력 시 호출될 콜백
 */
class WebViewKeyboardHandler(
    private val onOpenDevTools: (() -> Unit)? = null
) : CefKeyboardHandlerAdapter() {

    companion object {
        // CEF modifier flags (하드코딩된 정수값 - CEF API 경로 의존성 회피)
        private const val EVENTFLAG_COMMAND_DOWN = 128  // META/Command key on macOS
        private const val EVENTFLAG_ALT_DOWN = 16       // Option key on macOS
        private const val EVENTFLAG_CONTROL_DOWN = 4    // Ctrl key

        // Arrow key codes (AWT KeyEvent 상수 사용 - Windows VK code와 동일)
        private val ARROW_KEYS = setOf(
            KeyEvent.VK_LEFT,   // 37
            KeyEvent.VK_RIGHT,  // 39
            KeyEvent.VK_UP,     // 38
            KeyEvent.VK_DOWN    // 40
        )

        // Comma key code (Windows VK_OEM_COMMA = 0xBC = 188)
        // 주의: AWT KeyEvent.VK_COMMA(44)와 다름. CEF는 Windows VK code를 사용.
        private const val VK_OEM_COMMA = 188

        // F12 key code for DevTools
        private const val VK_F12 = 123
    }

    override fun onPreKeyEvent(
        browser: CefBrowser?,
        event: CefKeyboardHandler.CefKeyEvent?,
        is_keyboard_shortcut: BoolRef?
    ): Boolean {
        if (event == null || is_keyboard_shortcut == null) {
            return false
        }

        val keyCode = event.windows_key_code
        val modifiers = event.modifiers

        val isMetaDown = (modifiers and EVENTFLAG_COMMAND_DOWN) != 0
        val isAltDown = (modifiers and EVENTFLAG_ALT_DOWN) != 0
        val isCtrlDown = (modifiers and EVENTFLAG_CONTROL_DOWN) != 0
        val isArrowKey = keyCode in ARROW_KEYS

        // macOS: Cmd+Arrow, Option+Arrow (텍스트 내비게이션)
        if (isArrowKey && (isMetaDown || isAltDown)) {
            is_keyboard_shortcut.set(false)
        }

        // Cmd+, (macOS) 또는 Ctrl+, (Windows/Linux) - 설정 열기
        // IntelliJ의 ShowSettings 액션이 가로채지 않도록 WebView로 전달
        if (keyCode == VK_OEM_COMMA && (isMetaDown || isCtrlDown)) {
            is_keyboard_shortcut.set(false)
        }

        // Return false to allow normal processing
        return false
    }

    override fun onKeyEvent(
        browser: CefBrowser?,
        event: CefKeyboardHandler.CefKeyEvent?
    ): Boolean {
        if (event == null) {
            return false
        }

        // F12 키 감지하여 DevTools 열기
        if (event.windows_key_code == VK_F12 && event.type == CefKeyboardHandler.CefKeyEvent.EventType.KEYEVENT_KEYUP) {
            onOpenDevTools?.invoke()
            return true
        }

        // Let the browser handle the key event normally
        return false
    }
}
