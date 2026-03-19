package com.github.yhk1038.claudecodegui.editor

import com.intellij.ide.FileIconPatcher
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.vfs.VirtualFile
import javax.swing.Icon

/**
 * Patches the editor tab icon for [ClaudeCodeVirtualFile] when it has an unread badge.
 *
 * When streaming completes on a non-focused tab, [ClaudeCodeVirtualFile.badgeState] is set
 * to [TabBadge.UNREAD]. This patcher replaces the default icon with an orange-dot variant.
 * When the user returns to the tab, the badge is cleared and the original icon is restored.
 */
class ClaudeCodeFileIconPatcher : FileIconPatcher {

    override fun patchIcon(baseIcon: Icon, file: VirtualFile, flags: Int, project: Project?): Icon {
        if (file !is ClaudeCodeVirtualFile) return baseIcon
        if (file.badgeState == TabBadge.UNREAD) {
            return UNREAD_ICON
        }
        return baseIcon
    }

    companion object {
        private val UNREAD_ICON: Icon =
            IconLoader.getIcon("/icons/claudeCode-unread.svg", ClaudeCodeFileIconPatcher::class.java)
    }
}
