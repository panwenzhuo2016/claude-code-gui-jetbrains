package com.github.yhk1038.claudecodegui.bridge

/**
 * Maps WebView InputMode values to Claude CLI --permission-mode flag values.
 *
 * WebView에서 수신하는 inputMode 문자열(JSON raw string)은 fromInputMode()로 방어적으로 변환한다.
 */
enum class PermissionMode(val inputMode: String, val cliFlag: String) {
    PLAN("plan", "plan"),
    BYPASS("bypass", "bypassPermissions"),
    ASK_BEFORE_EDIT("ask_before_edit", "default"),
    AUTO_EDIT("auto_edit", "acceptEdits");

    companion object {
        private val INPUT_MODE_MAP = entries.associateBy { it.inputMode }

        /**
         * WebView에서 수신한 inputMode 문자열로부터 PermissionMode를 찾는다.
         * 알 수 없는 값이면 null을 반환하여 --permission-mode 플래그를 생략한다.
         */
        fun fromInputMode(inputMode: String?): PermissionMode? {
            if (inputMode == null) return null
            return INPUT_MODE_MAP[inputMode]
        }
    }
}
