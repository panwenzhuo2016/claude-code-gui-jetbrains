import {FC} from "react";
import {ToolUseBlockDto} from "@/dto";
import {LoadedMessageDto} from "@/types";
import { BashRenderer } from "./BashRenderer";
import {TodoWriteRenderer} from "./TodoWriteRenderer.tsx";
import {TaskRenderer} from "./TaskRenderer.tsx";

interface ToolRendererProps {
    toolUse: ToolUseBlockDto;
    toolResult?: LoadedMessageDto;
}

export function toolMapper() {
    const map = new Map<string, FC<ToolRendererProps>>();

    registerTool(map, BashRenderer);
    registerTool(map, TodoWriteRenderer);
    registerTool(map, TaskRenderer);

    return map;
}

function registerTool(map: Map<string, FC<ToolRendererProps>>, tool: FC<ToolRendererProps>, name?: string) {
    const key = name || tool.name.replace('Renderer', '');
    map.set(key, tool);
}
