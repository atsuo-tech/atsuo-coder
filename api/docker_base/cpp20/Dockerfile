FROM judge/base/cpp20

COPY . /app

WORKDIR /app

RUN echo CC:BUILD_STARTED
RUN g++ ./Main.cpp -o a.out -std=c++20

CMD echo CC:APP_STARTED && ./a.out
