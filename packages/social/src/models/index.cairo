//! Models

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Member {
    #[key]
    pub id: felt252,
    pub role: u8,
    pub guild_id: u32,
    pub pending_guild_id: u32,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Guild {
    #[key]
    pub id: u32,
    pub open: bool,
    pub free: bool,
    pub role: u8,
    pub member_count: u8,
    pub alliance_id: u32,
    pub pending_alliance_id: u32,
    pub metadata: ByteArray,
    pub socials: ByteArray,
}

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Alliance {
    #[key]
    pub id: u32,
    pub open: bool,
    pub free: bool,
    pub guild_count: u8,
    pub metadata: ByteArray,
    pub socials: ByteArray,
}
