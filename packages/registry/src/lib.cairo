pub mod constants;
pub mod store;

pub mod helpers {
    pub mod json;
}

pub mod types {
    pub mod role;
    pub mod metadata;
    pub mod socials;
}

pub mod models {
    pub mod index;
    pub mod access;
    pub mod achievement;
    pub mod game;
}

pub mod components {
    pub mod initializable;
    pub mod registerable;
    pub mod trackable;
}

#[cfg(test)]
mod tests {
    mod setup;
    mod test_registerable;
    mod test_trackable;

    mod mocks {
        pub mod register;
        pub mod tracker;
    }
}
