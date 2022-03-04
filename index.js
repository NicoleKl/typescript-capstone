"use strict";
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatus || (HttpStatus = {}));
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
})(HttpMethod || (HttpMethod = {}));
class Observer {
    constructor(handlers) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
    }
    next(value) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }
    error(error) {
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
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    static from(values) {
        return new Observable((observer) => {
            values.forEach((value) => observer.next(value));
            observer.complete();
            return () => {
                console.log('unsubscribed');
            };
        });
    }
    subscribe(obs) {
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
const handleRequest = (request) => {
    // handling of request
    return { status: HttpStatus.OK };
};
const handleError = (error) => {
    // handling of error
    return { status: HttpStatus.INTERNAL_SERVER_ERROR };
};
const handleComplete = () => console.log('complete');
const requests$ = Observable.from(requestsMock);
const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});
subscription.unsubscribe();
