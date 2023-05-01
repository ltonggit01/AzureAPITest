import * as ko from "knockout"
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import template from "./api-products-cards.html";
import { Product } from "../../../../../../models/product";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../../services/apiService";
import { RouteHelper } from "../../../../../../routing/routeHelper";

@Component({
    selector: "api-products-cards",
    template: template
})

export class ApiProductsCards {
    public readonly products: ko.ObservableArray<Product>;
    public readonly selectedApiName: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly nextLink: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.products = ko.observableArray([]);
        this.selectedApiName = ko.observable();
        this.working = ko.observable();
        this.nextLink = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (apiName) {
            this.selectedApiName(apiName);
            await this.loadPageOfProducts();
        }

        this.router.addRouteChangeListener(this.onRouteChange);
    }

    public async loadPageOfProducts(): Promise<void> {
        try {
            this.working(true);
            const apiName = this.selectedApiName();
            const pageOfProducts = await this.apiService.getApiProductsPage(apiName, {});
            this.products(pageOfProducts.value);
            this.nextLink(pageOfProducts.nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load API products. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public async loadMoreProducts(): Promise<void> {
        try {
            this.working(true);
            const pageOfProducts = await this.apiService.getApiProductsNextLink(this.nextLink());
            this.products.push(...pageOfProducts.value);
            this.nextLink(pageOfProducts.nextLink);
        }
        catch (error) {
            throw new Error(`Unable to load API products. Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    public getProductUrl(product: Product): string {
        return this.routeHelper.getProductReferenceUrl(product.name, "product");
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName || (apiName === this.selectedApiName())) {
            return;
        }

        this.selectedApiName(apiName);
        await this.loadPageOfProducts();
    }

}