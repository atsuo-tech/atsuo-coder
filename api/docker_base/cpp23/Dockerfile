FROM localhost/judge/base/cpp23

COPY . /app

WORKDIR /app

RUN echo CC:BUILD_STARTED
RUN g++ ./Main.cpp -o a.out -std=c++2a

CMD echo CC:APP_STARTED && ./a.out
