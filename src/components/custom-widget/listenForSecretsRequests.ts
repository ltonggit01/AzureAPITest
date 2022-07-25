import { APIM_ASK_FOR_SECRETS_MESSAGE_KEY, Secrets } from "@azure/api-management-custom-widgets-tools";

function listenForSecretsRequests(): void {
    window.addEventListener("message", ({data}) => {
        const value = data[APIM_ASK_FOR_SECRETS_MESSAGE_KEY];
        if (!value || !("instanceId" in value)) return

        const { instanceId, targetModule } = value;
        const widgetIFrame = (
            targetModule === "app"
                ? window.frames[0].document.getElementById(instanceId)
                : window.document.getElementById(instanceId)
        ) as HTMLIFrameElement;

        const secrets: Secrets = {token: "the secret token", userId: "42"} // TODO actual values
        widgetIFrame.contentWindow.postMessage({[APIM_ASK_FOR_SECRETS_MESSAGE_KEY]: secrets}, "*");
    });
}

export default listenForSecretsRequests