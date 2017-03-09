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
                            "name" : "Study Piano",
                            "videos" : ["CkH7eu1SFFU", "DHBa2ANs0fo", "wM20fE_FVQw", "kcihcYEOeic", "e2lSmznKgYU", "uB4W6oYO2-4", "3hfUndRs_Lw", "31FPc4VEhns", "bAR-7YatJxY", "34WaHFqw6vI", "Q49yNiQwIso", "FTrb55TZ0Nk", "LvOoQ0Ff2nA", "VfC4eQAUkkA", "Q-0KRZXG8Yw", "4r_DvtPXgOY", "lZH0MUSCsj0", "iLH-u80xgkI", "LWah1KSUZ-M", "XCpNWJf4DGU", "k016V2MiXpk", "zROWtpIQFS0", "rGaT7Ub6Neo", "w_WoJNWjUBk", "H9SsY9dDeo4", "bbU31JLtlug", "scgKP0rNTW0", "CudDTzXk8Lc", "kJcfwHxKkuk", "1mFAQGDRMGw"]
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
                            "name" : "Rhythm & Blues",
                            "videos" : ["VtcP0PFifpE", "1lQDPOfMUIA", "YgvVk22Ejpc", "9nJkGH80suo", "m5FDlbfnSVU", "ErUKBfLLk_k", "iOpJywrdCuQ", "qp1Pq2Fuw30", "pQeMS7yHDhk", "jmWYzG_ZxGs", "mRU8lnSTpFw", "i_pDozIPaPE", "WeANVMbkxxY", "-P8XCX57vEc", "ZlYNqPDZMKU", "kHo0pn8C7F0", "6rnIPEx7slE", "Sn2CjQTkLr8", "xw2d9mo7jYE", "nAZchTw--f4", "hZ67E2R77Uw", "5K_sDzmhedI", "_Jn1gnSYE4Q", "nZRg2Pn_y00", "CEph_2Qx-7Q", "Q6PJeu4oUFk", "KXGqHYNTNHU", "wdODuw5SZnE", "Tw8BJAOZSsw", "UbpSV3gBRfk"]
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
                        }
                     ];

module.exports = defaultPlaylist;
