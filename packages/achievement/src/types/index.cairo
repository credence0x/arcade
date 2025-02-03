/// Types

#[derive(Clone, Drop, Serde, Introspect)]
pub struct Task {
    pub id: felt252,
    pub total: u32,
    pub description: ByteArray,
}
