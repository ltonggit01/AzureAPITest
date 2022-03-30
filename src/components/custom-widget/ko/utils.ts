import { TCustomWidgetConfig } from "scaffold/scaffold";
import { MapiBlobStorage } from "../../../persistence";
import { CustomWidgetModel } from "../customWidgetModel";

export const OVERRIDE_CONFIG_SESSION_KEY_PREFIX = "MS_APIM_CW_devsrc_";

export const root = "custom-widgets";
export const dataFolder = "data";
export const configsFolder = "configs";
export const configFileName = "config.msapim.json";

export const widgetArchiveName = (config: TCustomWidgetConfig) => `${config.name}-msapim-widget.zip`;

export function buildBlobStorageSrc(name: string): string {
    return `/${root}/${dataFolder}/${name}`;
}

export async function buildWidgetSource(
    blobStorage: MapiBlobStorage,
    model: CustomWidgetModel,
    filePath: string,
    environment: string
): Promise<{ override: string | null, src: string }> {
    const developmentSrc = environment === "development"
        ? window.sessionStorage.getItem(OVERRIDE_CONFIG_SESSION_KEY_PREFIX + model.name)
        : null;

    // tslint:disable-next-line:triple-equals
    const url = new URL(developmentSrc == null ? (
        await blobStorage.getDownloadUrl(`${buildBlobStorageSrc(model.name)}/${filePath}`)
    ) : developmentSrc + filePath);

    url.pathname = decodeURIComponent(url.pathname);

    const values = {
        data: JSON.parse(model.customInputValue).data,
        origin: window.location.origin,
        id: model.name,
        displayName: model.widgetDisplayName,
        environment: environment,
    };
    url.searchParams.append("editorValues", encodeURIComponent(JSON.stringify(values)));

    /** invalidate cache every 1 ms on dev */
    if (environment === "development") url.searchParams.append("version", `${(new Date()).getTime()}`);

    return {override: developmentSrc, src: url.toString()};
}