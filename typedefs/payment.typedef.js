const paymentTypedef = `#graphql
    type Payment {
        _id: ID!
        user: ID!
        amount: Int!
        transactionId: String!
        receipt: String!
        status: String!
        createdAt: String!
        updatedAt: String!
    }

    input CreatePaymentInput {
        validFrom: String!
        validTill: String!
        days: Int!
    }

    input UpdatePaymentStatusInput {
        paymentId: ID!
        status: String!
    }

    type Query {
        getPaymentById(id: ID!): Payment
        getUserPayments(userId: ID!): [Payment!]!
        getAllPayments: [Payment!]!
        getPaymentsByStatus(status: String!): [Payment!]!
    }

    type Mutation {
        createPayment(input: CreatePaymentInput!): Payment!
        updatePaymentStatus(input: UpdatePaymentStatusInput!): Payment!
        deletePayment(id: ID!): Payment!
    }
`;

export default paymentTypedef;
