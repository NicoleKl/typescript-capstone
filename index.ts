enum HttpStatus {
    OK = 200,
    INTERNAL_SERVER_ERROR = 500
}

interface Status {
    status: HttpStatus
}

enum HttpMethod {
    GET,
    POST
}

interface Handlers {
    next: (v: RequestObject) => Status,
    error: (e: Error) => Status,
    complete: () => void,
}

interface RequestObject {
    method: string,
    host: string,
    path: string,
    body?: User,
    params: { id?: string},
}

interface User {
    name: string,
    age: number,
    roles: string[],
    createdAt: Date,
    isDeleted: boolean,
}

class Observer {
    handlers: Handlers;
    isUnsubscribed: boolean;
    _unsubscribe?: () => void;

    constructor(handlers: Handlers) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
    }

    next(value: RequestObject) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }

    error(error: Error) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }

            this.unsubscribe();
        }
    }

    complete() {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }

            this.unsubscribe();
        }
    }

    unsubscribe() {
        this.isUnsubscribed = true;

        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}

class Observable {
    _subscribe: (observer: Observer) => () => void;

    constructor(subscribe: (observer: Observer) => () => void) {
        this._subscribe = subscribe;
    }

    static from(values: RequestObject[]) {
        return new Observable((observer) => {
            values.forEach((value) => observer.next(value));

            observer.complete();

            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: Handlers) {
        const observer = new Observer(obs);

        observer._unsubscribe = this._subscribe(observer);

        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}


const userMock = {
    name: 'User Name',
    age: 26,
    roles: [
        'user',
        'admin'
    ],
    createdAt: new Date(),
    isDeleted: false,
};

const requestsMock = [
    {
        method: HttpMethod[HttpMethod.POST],
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HttpMethod[HttpMethod.GET],
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];

const handleRequest = (request: RequestObject) => {
    // handling of request
    return {status: HttpStatus.OK};
};
const handleError = (error: Error) => {
    // handling of error
    return {status: HttpStatus.INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});

subscription.unsubscribe();
