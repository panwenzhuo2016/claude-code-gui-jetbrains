/** CLI control_request event payload received via CLI_EVENT message */
export interface CliControlRequestEvent {
  type: 'control_request';
  request_id: string;
  request: {
    subtype: string;
    tool_name?: string;
    tool_use_id?: string;
    input?: Record<string, unknown>;
    description?: string;
    [key: string]: unknown;
  };
}
