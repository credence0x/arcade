/// Models

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Access {
    #[key]
    pub address: felt252,
    pub role: u8,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key]
    pub world_address: felt252,
    #[key]
    pub namespace: felt252,
    pub project: felt252,
    pub active: bool,
    pub published: bool,
    pub whitelisted: bool,
    pub priority: u8,
    pub karma: u16,
    pub preset: felt252,
    pub metadata: ByteArray,
    pub socials: ByteArray,
    pub owner: felt252,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Achievement {
    #[key]
    pub world_address: felt252,
    #[key]
    pub namespace: felt252,
    #[key]
    pub id: felt252,
    pub published: bool,
    pub whitelisted: bool,
    pub karma: u16,
}
