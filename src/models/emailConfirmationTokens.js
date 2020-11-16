import { DataTypes } from 'sequelize';
import models from '.';

import Sequelize from '../sequelize';

import { encrypt } from "../utils/encryption";


const email_confirmation_token = Sequelize.define(
    'email_confirmation_token',
    {
        token_value: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        timestamps: true,
        underscored: true
    }
);

const initialize = (models) => {
    models.email_confirmation_token.belongsTo(models.user, {
        as: 'user',
        foreignKey: {
            name: 'user_id',
            allowNull: false
        }
    });

    models.email_confirmation_token.prototype.createEmailConfirmationToken = async function () {
        const user = await models.user.findOne({
            where: {
                id: this.user_id
            }
        })

        const key = user.username + user.email + Math.floor(Math.random() * 9999);
        var key2 = "";

        for (var i = 0; i < key.length; i++) {
            key2 += key[i] + Math.floor(Math.random() * 9);
        }

        this.token_value = encrypt(key2)
        this.save();
        return this.token_value;
    }
};


export default { model: email_confirmation_token, initialize };