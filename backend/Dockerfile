FROM golang:1.22.5-alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux

WORKDIR /backend

COPY . ./

RUN go mod download

RUN go build -tags=jsoniter -o main .

WORKDIR /dist

RUN cp /backend/main .

FROM scratch

ADD zoneinfo.zip .
ENV ZONEINFO /zoneinfo.zip

COPY --from=builder /dist/main .
COPY ./assets assets/

ENTRYPOINT ["/main"]