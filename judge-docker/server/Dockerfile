FROM ubuntu:24.04

WORKDIR /root/app

# Change Permissions

RUN chmod 700 /root/app

# Add user

RUN useradd judge
RUN rm -rf /home/judge
RUN mkdir /home/judge
RUN chown -R judge:judge /home/judge

# Install nodejs

USER root

RUN apt update
RUN apt install -y nodejs npm
RUN echo node -v
RUN echo npm -v

# Install Sudo

RUN apt install -y sudo

# Install Needed Compilers

RUN apt install -y gcc g++ openjdk-17-jdk nasm

# Install app

COPY ./app /root/app

RUN npm -D install
RUN npm run build

CMD ["npm", "start", "localhost", "6431"]
