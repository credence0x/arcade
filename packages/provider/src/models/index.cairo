//! Models

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Deployment {
    #[key]
    pub service: u8,
    #[key]
    pub project: felt252,
    pub status: u8,
    pub tier: u8,
    pub config: ByteArray,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Factory {
    #[key]
    pub id: u8,
    pub version: felt252,
    pub default_version: felt252,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Team {
    #[key]
    pub id: felt252,
    pub deployment_count: u32,
    pub time: u64,
    pub name: felt252,
    pub description: ByteArray,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Teammate {
    #[key]
    pub team_id: felt252,
    #[key]
    pub time: u64,
    #[key]
    pub account_id: felt252,
    pub role: u8,
}
