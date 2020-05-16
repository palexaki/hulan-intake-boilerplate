export enum Role {
    ADMIN, USER
}

export interface User {
    id: string;
    username: string;
    role: Role;
}

export enum BeerType {
    PILSNER,
    IPA,
    WHEAT,
    BROWN,
    PORTER,
    STOUT,
    SOUR
}

export const beerTypes: BeerType[] = [
    BeerType.PILSNER,
    BeerType.IPA,
    BeerType.WHEAT,
    BeerType.BROWN,
    BeerType.PORTER,
    BeerType.STOUT,
    BeerType.SOUR
]


export function beerTypeName(beerType: BeerType): string {
    return BeerType[beerType];
}

export interface Beer {
    id: string;
    name: string;
    description: string;
    type: BeerType;
    percentage: number;
    brewers?: string[];
}

export interface Brewer {
    id: string;
    name: string;
    city: string;
    beerIds: string[];

    beers?: Beer[];
}

type Token = string;

export interface SessionToken {
    id: string;
    token: Token;
    timestamp: Date;
    userId: string;
}

export interface Credentials {
    username: string;
    password: string;
}

type NewBeer = Pick<Beer, "name" | "description" | "type" | "percentage">;
type NewBrewer = Pick<Brewer, "name" | "city" | "beerIds">;

interface BeerApi {
    validateSession: (token: Token) => Promise<SessionToken>;
    login: (credentials: Credentials) => Promise<SessionToken>;
    logout: () => Promise<boolean>;

    getUser: (userId: string) => Promise<User>;

    getBeers: () => Promise<Beer[]>;
    createBeer: (beer: NewBeer) => Promise<Beer>;
    updateBeer: (beer: Beer) => Promise<Beer>;
    deleteBeer: (beer: Beer) => Promise<Beer>;

    getBrewers: (attachBeers: boolean) => Promise<Brewer[]>;
    createBrewer: (brewer: NewBrewer) => Promise<Brewer>;
    updateBrewer: (brewer: Brewer) => Promise<Brewer>;
    deleteBrewer: (brewer: Brewer) => Promise<Brewer>;
}

export const api: BeerApi = (() => {
    let sessionToken: SessionToken;
    const url: string = "https://intake-api.hulan.nl/";

    async function makeRequest<R, T>(method: string, endpoint: string, body?: T,
                                     requiresToken: boolean = true,
                                     parseResult: boolean = true, token?: string): Promise<R> {
        const init: RequestInit = {
            headers: {},
            method: method
        };

        if (requiresToken && !(token || sessionToken)) {
            throw new Error("You do not have a valid running session");
        } else if (token) {
            init.headers["Authorization"] = token;
        } else if (requiresToken && sessionToken) {
            init.headers["Authorization"] = sessionToken.token;
        }

        if (body) {
            init.headers["Content-Type"] = "application/json";
            init.body = JSON.stringify(body);
        }

        const res = await fetch(url + endpoint, init);
        if (res.ok) {
            if (parseResult) {
                return res.json();
            } else {
                return;
            }
        } else {
            throw new Error(await res.text());
        }
    }

    // Define api
    async function validateSession(token: Token): Promise<SessionToken> {
        if (sessionToken) {
            return sessionToken;
        }
        sessionToken = await makeRequest("POST", "authentication/validate",
                                         undefined, true, true, token);
        return sessionToken;
    }

    async function login(credentials: Credentials): Promise<SessionToken> {
        if (sessionToken) {
            return sessionToken;
        }
        const result: SessionToken = await makeRequest("POST", "authentication/",
                                                       credentials, false);
        sessionToken = result;
        return result;
    }

    async function logout(): Promise<boolean> {
        try {
            await makeRequest("POST", "authentication/logout", undefined, true, false);
            sessionToken = null;
            return true;
        } catch {
            return false;
        }
    }


    async function getUser(userId: string): Promise<User> {
        return makeRequest("GET", "users/"+userId);
    }

    async function getBeers(): Promise<Beer[]> {
        return makeRequest("GET", "beers/");
    }

    async function createBeer(beer: NewBeer): Promise<Beer> {
        return makeRequest("POST", "beers/", beer);
    }

    async function updateBeer(beer: Beer): Promise<Beer> {
        return makeRequest("PUT", "beers/", beer);
    }

    async function deleteBeer(beer: Beer): Promise<Beer> {
        return makeRequest("DELETE", "beers/"+beer.id);
    }


    async function getBrewers(attachBeers: boolean): Promise<Brewer[]> {
        return makeRequest("GET", "brewers/" + (attachBeers ? "?populate" : ""));
    }

    async function createBrewer(brewer: NewBrewer): Promise<Brewer> {
        return makeRequest("POST", "brewers/", brewer);
    }

    async function updateBrewer(brewer: Brewer): Promise<Brewer> {
        return makeRequest("PUT", "brewers/", brewer);
    }

    async function deleteBrewer(brewer: Brewer): Promise<Brewer> {
        return makeRequest("DELETE", "brewers/"+brewer.id);
    }


    return {
        validateSession: validateSession,
        login: login,
        logout: logout,

        getUser: getUser,

        getBeers: getBeers,
        createBeer: createBeer,
        updateBeer: updateBeer,
        deleteBeer: deleteBeer,

        getBrewers: getBrewers,
        createBrewer: createBrewer,
        updateBrewer: updateBrewer,
        deleteBrewer: deleteBrewer,
    }


})();
