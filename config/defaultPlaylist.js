'use strict'

var defaultPlaylist = [
                        {
                            "name" : "Good Vibes",
                            "videos" : [
                                "Fv_lnUTUQYY",
                                "HoT1cvWDBjE",
                                "7dqMyh4ILIg",
                                "QItwYWV-3Qk",
                                "h4KCIIZ3Z2c",
                                "hZe5K1DN4ec",
                                "sN5__shLZ8k",
                                "D5drYkLiLI8",
                                "enum2qHUK70",
                                "isfrigczpiA",
                                "DTWAavrVNQA",
                                "RhU9MZ98jxo",
                                "kfJOSX1tqgU",
                                "1YRW1QRKTBc",
                                "dlF1KxtArCg",
                                "BqaoAQbkeXo",
                                "nkziIXxfMrg"
                            ]
                        },
                        {
                            "name" : "Pop Picks",
                            "videos" : [
                                "FM7MFYoylVs",
                                "JGwWNGJdvx8",
                                "PMivT7MJ41M",
                                "fWGD2Cr9StM",
                                "1ekZEVeXwek",
                                "9ORWF5RkdO0",
                                "h--P8HzYZ74",
                                "XatXy6ZhKZw",
                                "-zzP29emgpg",
                                "hRVfCplkKq4",
                                "dMK_npDG12Q",
                                "7F37r50VUTQ",
                                "lNzHARgbCG8",
                                "W425ePh2aKw",
                                "J5qWnG5RQTk"

                            ]
                        },
                        {
                            "name" : "Weekly Buzz",
                            "videos" : [
                                "gL-WVjvzu34",
                                "-AfjBifqK_E",
                                "GKwO8SJ4_uI",
                                "v7mIK4fqZf0",
                                "fkRHyYjv3u4",
                                "IbQ4FXckI7Q",
                                "5R9SlFF1J-8",
                                "w2DeJ0q1Wv4",
                                "vsEeUNtkUhU",
                                "FaX64o71vGQ"
                            ]
                        },
                        {
                            "name" : "Chill Party",
                            "videos" : ["PM_p9rcUYjQ", "SJKxrWr9WNk", "wTsemGqie4M", "b5JcrJGG4nk", "c2Dufl1UQFA", "7ZQJR61qAHY", "l1321DZLmA0", "MvtLJ70wq0g", "7Sa5R6yheys", "pSmgyywxTiA", "F5-kwSR8n1w", "tzKDGSqX8rc", "AHxTy_XOVw0", "EOzZdSc80AE", "dD09-fQTUD8", "62bEX3QdQ6k", "qtHDuH5bqeI", "KuxZoaPYVks", "6aUkst9Uxl4", "7TQXne8CfXI", "Yi31UMIs-RU", "t7gNyYbxxiM", "2Z6_cfed0JQ", "mP9OABL74Ks", "XZ5AjnGlij4", "os_5iwxq4jc"]
                        },
                        {
                            "name" : "Sunday Morning",
                            "videos" : ["IMGVNFf5x78", "K08a2DrSX4Y", "Iv8-qTt7xaM", "Rfhksohebv8", "_Jkny_2rM_M", "dsMb94jPUsU", "RSgePGwRoM0", "ePsYlF9n58A", "CQuaeupNr0Q", "Njq4E0q-mgY", "G_ypVIJEK0M", "xEp8KinY7SY", "H3f3Mpq2NfQ", "TxzCGjyKx20", "B75FBqUn2T4", "LPJcdZQJ2vA", "sJ4KgureY_w", "UifuuynvrlY", "GkO7dWn2hXI", "FH7QbP_Ki1Q"]
                        },
                        {
                            "name" : "Autumn Sunse",
                            "videos" : ["P3v7HyX02Zk", "yLZx4HK27-s", "Sz2FT775LdQ", "z5XFCATDGh8", "8iVvDJrAQi4", "jz1uDD0Uiu8", "bvg8lN3WCnQ", "AvKnsJRarOk", "O6jVao3su48", "aTCob37s_EI", "9vkRkiSl3KE", "PGkqUs8YJkU", "DGAi4Boix40", "lx2M3wEG1R4", "dakNPUIzuNw", "aHwFQgLdfjg", "qRMrHXhzqWo", "CIC2zjPNRRI", "0pYjG42YEkM", "H15GXisIsvY", "XE8ZXLOjKrM", "FVrw0cPYXlA", "tPduAkdbx6c", "kUXkgzgt-GI", "t-Bl_ZbAN0M", "c5-C5ZFwSi8", "esm50jku2Ow", "ENz5rHynSpQ", "Z5enbMfSywU", "LPJcdZQJ2vA", "NBl8dwbDJfA", "H6peX4xngxM", "GcIQS4QIijE", "etfzPOYhxiQ", "RdlBRBSL_v8", "TIxy7PLVJsg"]
                        },
                        {
                            "name" : "Snowfall",
                            "videos" : ["hUsOQA4n_MA", "LMcNdW9SYyQ", "UaN5O7pym6A", "4HVjldqWx4w", "A-xndU0pU7c", "s5rjuUrNrZA", "HFadyxYwvEY", "nW480ygxJvA", "AKp2cBQbG5g", "mjFmMOTFrro", "50KBdsVOtPE", "THx9SIdh2rE", "4KrIiXn43Ms", "91_-2OTlncM", "zcIMVLEGa7I", "8nfOAUqepKY", "cRtv2K7dwzw", "jPsn9k9nLnI", "Atg46YvRF9c", "dw7taQEL_2Y", "IGnpaAqw0g0", "sCm8yihF8Pk", "EYK1ingIZBM", "c2mDqfMYCBo", "2a_db0d4nss", "ci_qqD7Ho2Y", "VzfSD1ULfd0", "PlN1XABgrS4", "4Z1u4Z1MKH8", "Ij_vcZyvWfo", "iZN306t604g", "UQpuyVD1-0k", "3klCVv9McV0", "FuQeP_JXlQo"]
                        }
                     ];

module.exports = defaultPlaylist;
