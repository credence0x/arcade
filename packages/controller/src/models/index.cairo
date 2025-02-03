//! Models

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Account {
    #[key]
    pub id: felt252,
    pub controllers: u32,
    pub name: felt252,
    pub username: felt252,
    pub socials: ByteArray,
    pub credits: felt252,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Controller {
    #[key]
    pub account_id: felt252,
    #[key]
    pub id: felt252,
    pub signers: u32,
    pub address: felt252,
    pub network: felt252,
    pub constructor_calldata: ByteArray,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Signer {
    #[key]
    pub account_id: felt252,
    #[key]
    pub controller_id: felt252,
    pub method: u8,
    pub metadata: ByteArray,
}
