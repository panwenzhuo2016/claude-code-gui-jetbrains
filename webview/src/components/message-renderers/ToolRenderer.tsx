import React from 'react';
import {LoadedMessageDto} from '../../types';
import {ToolUseBlockDto} from '../../dto/message/ContentBlockDto';
import {ToolRendererMap} from "./ToolRenderers";
import {ToolHeader, ToolWrapper} from "./ToolRenderers/common";

interface ToolRendererProps {
    toolUse: ToolUseBlockDto;
    message?: LoadedMessageDto;
}

export const ToolRenderer: React.FC<ToolRendererProps> = ({toolUse, message}) => {
    const toolResult = toolUse.tool_result as LoadedMessageDto | undefined;

    const Renderer = ToolRendererMap.get(toolUse.name)
    if (Renderer) {
        return <Renderer toolUse={toolUse} toolResult={toolResult} message={message} />
    }

    return (
        <ToolWrapper message={message} onClick={() => console.log(toolUse)}>
            <ToolHeader name={toolUse.name} description={'unknown'} />
        </ToolWrapper>
    );
};
