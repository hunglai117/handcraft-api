create table migrations
(
    id        serial
        constraint "PK_8c82d7f526340ab734260ea46be"
            primary key,
    timestamp bigint  not null,
    name      varchar not null
);

alter table migrations
    owner to "user";

create table users
(
    id         bigint                                          not null
        constraint "PK_a3ffb1c0c8416b9fc6f907b7433"
            primary key,
    created_at timestamp       default now()                   not null,
    updated_at timestamp       default now()                   not null,
    full_name  varchar(100)                                    not null,
    email      varchar(100)                                    not null
        constraint "UQ_97672ac88f789774dd47f7c8be3"
            unique,
    password   varchar,
    role       users_role_enum default 'user'::users_role_enum not null,
    phone      varchar,
    address    varchar(255),
    city       varchar(100),
    country    varchar(100)
);

alter table users
    owner to "user";

create table user_providers
(
    id               bigint                       not null
        constraint "PK_7c253db00c7cac2a44f1f5a5c58"
            primary key,
    created_at       timestamp default now()      not null,
    updated_at       timestamp default now()      not null,
    user_id          bigint                       not null
        constraint "FK_66144f0536826f644ce18baac3a"
            references users
            on delete cascade,
    provider         user_providers_provider_enum not null,
    provider_user_id varchar(255)                 not null,
    provider_data    json
);

alter table user_providers
    owner to "user";

create table promotions
(
    id                   bigint                                                                   not null
        constraint "PK_380cecbbe3ac11f0e5a7c452c34"
            primary key,
    created_at           timestamp            default now()                                       not null,
    updated_at           timestamp            default now()                                       not null,
    name                 varchar(255)                                                             not null,
    description          text,
    promo_code           varchar(50)
        constraint "UQ_a2fe38bc8f7eb230aa9ee750b86"
            unique,
    type                 promotions_type_enum default 'PERCENTAGE_DISCOUNT'::promotions_type_enum not null,
    discount_value       numeric(10, 2)       default '0'::numeric                                not null,
    minimum_order_amount numeric(10, 2),
    start_date           timestamp            default now()                                       not null,
    end_date             timestamp                                                                not null,
    is_active            boolean              default true                                        not null,
    usage_limit          integer                                                                  not null,
    usage_count          integer              default 0                                           not null
);

alter table promotions
    owner to "user";

create table categories
(
    id             bigint                  not null
        constraint "PK_24dbc6126a28ff948da33e97d3b"
            primary key,
    created_at     timestamp default now() not null,
    updated_at     timestamp default now() not null,
    name           varchar(255)            not null,
    slug           varchar(255)            not null,
    image          text,
    parent_id      bigint
        constraint "FK_88cea2dc9c31951d06437879b40"
            references categories,
    is_leaf        boolean   default true  not null,
    products_count integer   default 0     not null
);

alter table categories
    owner to "user";

create table products
(
    id             bigint                                       not null
        constraint "PK_0806c755e0aca124e67c0cf6d7d"
            primary key,
    created_at     timestamp   default now()                    not null,
    updated_at     timestamp   default now()                    not null,
    name           varchar(255)                                 not null,
    slug           varchar(255)                                 not null
        constraint "UQ_464f927ae360106b783ed0b4106"
            unique,
    description    text,
    category_id    bigint
        constraint "FK_9a5f6868c96e0069e699f33e124"
            references categories,
    currency       varchar(10) default 'VND'::character varying not null,
    images         jsonb,
    featured_image varchar(255),
    price_min      numeric(12, 2),
    price_max      numeric(12, 2),
    in_stock       boolean     default true                     not null
);

alter table products
    owner to "user";

create table product_options
(
    id         bigint                  not null
        constraint "PK_3916b02fb43aa725f8167c718e4"
            primary key,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    product_id bigint                  not null
        constraint "FK_49677f87ad61a8b2a31f33c8a2c"
            references products
            on delete cascade,
    name       varchar(100)            not null
);

alter table product_options
    owner to "user";

create table product_variants
(
    id             bigint                  not null
        constraint "PK_281e3f2c55652d6a22c0aa59fd7"
            primary key,
    created_at     timestamp default now() not null,
    updated_at     timestamp default now() not null,
    product_id     bigint                  not null
        constraint "FK_6343513e20e2deab45edfce1316"
            references products
            on delete cascade,
    title          varchar(255)            not null,
    price          numeric(12, 2)          not null,
    sku            varchar(50),
    stock_quantity integer   default 0     not null,
    weight         numeric(10, 2),
    image          text,
    purchase_count integer   default 0     not null
);

alter table product_variants
    owner to "user";

create table product_variant_options
(
    id          bigint                  not null
        constraint "PK_cd62d81fd4813d94bfd1ef7cda5"
            primary key,
    created_at  timestamp default now() not null,
    updated_at  timestamp default now() not null,
    variant_id  bigint                  not null
        constraint "FK_7a3d01d76ff30675b0c15549127"
            references product_variants
            on delete cascade,
    option_id   bigint                  not null
        constraint "FK_f64b1ce3f1b45e90b473c9bb55f"
            references product_options
            on delete cascade,
    order_index integer                 not null,
    value       varchar(100)            not null
);

alter table product_variant_options
    owner to "user";

create table orders
(
    id             bigint                                           not null
        constraint "PK_710e2d4957aa5878dfe94e4ac2f"
            primary key,
    created_at     timestamp   default now()                        not null,
    updated_at     timestamp   default now()                        not null,
    user_id        bigint                                           not null
        constraint "FK_a922b820eeef29ac1c6800e826a"
            references users,
    order_status   varchar(50) default 'pending'::character varying not null,
    total_amount   numeric(12, 2)                                   not null,
    payment_status varchar(50) default 'pending'::character varying not null,
    shipping_info  jsonb,
    notes          text
);

alter table orders
    owner to "user";

create table order_items
(
    id                 bigint                  not null
        constraint "PK_005269d8574e6fac0493715c308"
            primary key,
    created_at         timestamp default now() not null,
    updated_at         timestamp default now() not null,
    order_id           bigint                  not null
        constraint "FK_145532db85752b29c57d2b7b1f1"
            references orders
            on delete cascade,
    product_variant_id bigint                  not null
        constraint "FK_11836543386b9135a47d54cab70"
            references product_variants,
    quantity           integer                 not null,
    unit_price         numeric(12, 2)          not null,
    total_price        numeric(12, 2)          not null
);

alter table order_items
    owner to "user";

create table order_promotions
(
    id              bigint                  not null
        constraint "PK_8b954a0f6ddbc1fd05b35fc3d1e"
            primary key,
    created_at      timestamp default now() not null,
    updated_at      timestamp default now() not null,
    order_id        bigint                  not null
        constraint "FK_1fe389485d755eefbfc08f9fae2"
            references orders
            on delete cascade,
    promotion_id    bigint
        constraint "FK_15a564530fed2d1d6a7757d7ea9"
            references promotions
            on delete set null,
    discount_amount numeric(12, 2)          not null
);

alter table order_promotions
    owner to "user";

create table payment_transactions
(
    id             bigint                                           not null
        constraint "PK_d32b3c6b0d2c1d22604cbcc8c49"
            primary key,
    created_at     timestamp   default now()                        not null,
    updated_at     timestamp   default now()                        not null,
    order_id       bigint                                           not null
        constraint "FK_0f581511ac19ecb02dab437cd41"
            references orders
            on delete cascade,
    payment_method varchar(50)                                      not null,
    amount         numeric(10, 2)                                   not null,
    payment_status varchar(50) default 'pending'::character varying not null,
    metadata       json
);

alter table payment_transactions
    owner to "user";

create table carts
(
    id         bigint                  not null
        constraint "PK_b5f695a59f5ebb50af3c8160816"
            primary key,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    user_id    bigint                  not null
        constraint "FK_2ec1c94a977b940d85a4f498aea"
            references users
);

alter table carts
    owner to "user";

create table cart_items
(
    id                 bigint                  not null
        constraint "PK_6fccf5ec03c172d27a28a82928b"
            primary key,
    created_at         timestamp default now() not null,
    updated_at         timestamp default now() not null,
    cart_id            bigint                  not null
        constraint "FK_6385a745d9e12a89b859bb25623"
            references carts
            on delete cascade,
    product_variant_id bigint                  not null
        constraint "FK_de29bab7b2bb3b49c07253275f1"
            references product_variants,
    quantity           integer   default 1     not null
);

alter table cart_items
    owner to "user";


