FROM ubuntu:20.04

# software-properties-common 対策で、先に指定しておく
ENV TZ=Asia/Tokyo

RUN apt update && \
    apt -y upgrade && \
    apt install -y software-properties-common sudo

# ユーザー追加
RUN useradd -m ubuntu && \
    gpasswd -a ubuntu sudo && \
    # ユーザーのパスワードを無効にする、空にする
    passwd -d ubuntu
USER ubuntu
WORKDIR /home/ubuntu

# Install Rust
RUN sudo apt install -y git clang curl libssl-dev llvm libudev-dev build-essential g++ make cmake gcc && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    ~/.cargo/bin/rustup default stable && \
    ~/.cargo/bin/rustup update && \
    ~/.cargo/bin/rustup update nightly && \
    ~/.cargo/bin/rustup target add wasm32-unknown-unknown --toolchain nightly

# Install Substrate
RUN git clone --depth 1 https://github.com/substrate-developer-hub/substrate-node-template.git && \
    cd substrate-node-template && \
    ~/.cargo/bin/cargo update && \
    ~/.cargo/bin/cargo build --release

# Create a dedicated user for the node binary and copy it to /user/sbin:
RUN sudo useradd --no-create-home --shell /usr/sbin/nologin substrate && \
    sudo cp ./substrate-node-template/target/release/node-template /usr/local/bin/substrate && \
    sudo chown substrate:substrate /usr/local/bin/substrate

# Create a dedicated directory for the chain storage data:
RUN sudo mkdir /var/lib/substrate && \
    sudo chown substrate:substrate /var/lib/substrate

