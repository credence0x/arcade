mod store;

mod types {
    pub mod index;
    pub mod task;
}

mod events {
    pub mod index;
    pub mod creation;
    pub mod progress;
    pub mod pinning;
}

mod components {
    pub mod achievable;
    pub mod pinnable;
}

#[cfg(test)]
mod tests {
    pub mod setup;
    pub mod test_achievable;

    pub mod mocks {
        pub mod achiever;
    }
}
