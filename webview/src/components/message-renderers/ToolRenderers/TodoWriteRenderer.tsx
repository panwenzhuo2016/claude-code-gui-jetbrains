import {ToolHeader, ToolWrapper} from "@/components/message-renderers/ToolRenderers/common";
import {ToolUseBlockDto} from "@/dto";
import {LoadedMessageDto} from "@/types";


class TodoWriteToolUseDto extends ToolUseBlockDto {
    caller: { type: 'direct' };
    declare input: {
        todos: {
            content: string;
            status: 'completed' | 'in_progress';
            activeForm: string;
        }[];
    };
}

interface Props {
    toolUse: ToolUseBlockDto;
    toolResult?: LoadedMessageDto;
}

export function TodoWriteRenderer(props: Props) {
    const toolUse = props.toolUse as unknown as TodoWriteToolUseDto;
    const todos = toolUse.input.todos;
    // const toolResult = props.toolResult as BashToolResultDto | undefined;
    //
    // const name = toolUse.name;
    // const description = toolUse.input?.description ?? '';
    // const input = toolUse.input?.command ?? '' as string;
    // const output = toolResult?.message?.content[0].content ?? '' as string;

    return (
        <ToolWrapper onClick={() => console.log(props.toolUse, todos)}>
            <ToolHeader name="Update Todos"/>

            <div className="text-[12px] font-mono flex flex-col gap-[8px]">
                {todos.map((todo, i) => {
                    const isChecked = todo.status === 'completed';

                    return (
                        <div key={i}>
                            <div className={`flex items-start gap-2 ${isChecked ? 'opacity-40 line-through' : ''}`}>
                                <div><input type="checkbox" defaultChecked={isChecked} disabled /></div>
                                <div>{todo.content}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ToolWrapper>
    );
}
