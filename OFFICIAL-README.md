# Next.js SAM（日本語訳）

このプロジェクトには、SAM CLIを使用してデプロイ可能なサーバーレスアプリケーションのソースコードおよびサポートファイルが含まれています。以下のファイルやフォルダが含まれています。

- **nextjs-lambda-sam** - Next.js サンプルアプリケーション。
- [template.yaml](template.yaml) - アプリケーションのAWSリソースを定義するテンプレート。

このアプリケーションは、CloudFront、Lambda、API Gateway、S3を含む複数のAWSリソースを使用しています。これらのリソースは、このプロジェクトの[template.yaml](template.yaml)ファイル内で定義されています。テンプレートを更新することで、同じデプロイプロセスを利用してAWSリソースを追加したり、アプリケーションコードを更新したりできます。

## サンプルアプリケーションをデプロイする

Serverless Application Model Command Line Interface (SAM CLI) は、AWS CLI の拡張機能であり、Lambdaアプリケーションの構築とテストのための機能を追加します。SAM CLIは、Dockerを使用してLambdaに対応したAmazon Linux環境内で関数を実行します。また、アプリケーションのビルド環境やAPIをエミュレートすることも可能です。

SAM CLIを使用するには、以下のツールが必要です。

- **SAM CLI** - [SAM CLIをインストールする](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- **Node.js** - [Node.js 16をインストールする](https://nodejs.org/en/)、NPMパッケージ管理ツールを含む。
- **Docker** - [Dockerコミュニティエディションをインストールする](https://hub.docker.com/search/?type=edition&offering=community)

アプリケーションを初めてビルドおよびデプロイするには、以下のコマンドをシェルで実行してください。

```bash
sam build
sam deploy --guided
```

最初のコマンドはアプリケーションのソースをビルドします。2つ目のコマンドは、アプリケーションをAWSにパッケージ化してデプロイします。この際、以下のプロンプトが表示されます。

- **Stack Name**: CloudFormationにデプロイするスタックの名前。アカウントとリージョン内で一意である必要があり、プロジェクト名に基づく名前が適切です。
- **AWS Region**: アプリケーションをデプロイするAWSリージョン。
- **Confirm changes before deploy**: 「はい」を選択すると、変更セットが実行前に手動で確認可能になります。「いいえ」の場合、AWS SAM CLIが自動的に変更をデプロイします。
- **Allow SAM CLI IAM role creation**: 多くのAWS SAMテンプレート（この例を含む）は、AWSサービスにアクセスするために必要なIAMロールを作成します。デフォルトでは、最小限の権限に制限されています。IAMロールを作成または変更するCloudFormationスタックをデプロイするには、`capabilities`に`CAPABILITY_IAM`値を指定する必要があります。このプロンプトで許可しない場合、この例をデプロイするには、明示的に`sam deploy`コマンドに`--capabilities CAPABILITY_IAM`を指定する必要があります。
- **Save arguments to samconfig.toml**: 「はい」を選択すると、選択内容がプロジェクト内の構成ファイルに保存され、今後はパラメータなしで`sam deploy`を再実行するだけでアプリケーションの変更をデプロイできます。

デプロイ後、CloudFrontエンドポイントURLは出力値に表示されます。

## 静的リソースをS3にデプロイ（CI/CDプロセスに組み込むことを推奨）

```bash
aws s3 cp .next/static/ s3://<YOUR-BUCKET-NAME>/_next/static --recursive
aws s3 cp public/static s3://<YOUR-BUCKET-NAME>/static --recursive
```

## SAM CLIを使用してローカルでビルドとテストを実行

`sam build`コマンドでアプリケーションをビルドします。

```bash
nextjs-lambda-sam$ sam build
```

SAM CLIは、`nextjs-lambda-sam/package.json`で定義された依存関係をインストールし、デプロイメントパッケージを作成して`.aws-sam/build`フォルダに保存します。

単一の関数をテストイベントで直接呼び出してテストします。イベントは、イベントソースから関数が受け取る入力を表すJSONドキュメントです。このプロジェクトには、`events`フォルダにテストイベントが含まれています。

`sam local invoke`コマンドを使用してローカルで関数を実行し、呼び出します。

```bash
nextjs-lambda-sam$ sam local invoke NextjsFunction --event events/event.json
```

SAM CLIはアプリケーションのAPIをエミュレートすることもできます。`sam local start-api`を使用して、ポート3000でAPIをローカル実行します。

```bash
nextjs-lambda-sam$ sam local start-api
nextjs-lambda-sam$ curl http://localhost:3000/
```

SAM CLIはアプリケーションテンプレートを読み込み、APIのルートとそれに関連付けられた関数を決定します。各関数定義の`Events`プロパティには、各パスのルートとメソッドが含まれています。

```yaml
	  Events:
        RootPath:
          Type: Api
          Properties:
            Path: /
            Method: ANY
        AnyPath:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
```

## アプリケーションにリソースを追加する

アプリケーションテンプレートは、AWS Serverless Application Model (AWS SAM) を使用してアプリケーションのリソースを定義します。AWS SAMはAWS CloudFormationの拡張であり、関数、トリガー、APIなどの一般的なサーバーレスアプリケーションリソースを簡単に構成できるシンプルな構文を提供します。[SAM仕様](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md)に含まれていないリソースについては、標準的な[AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)リソースタイプを使用できます。

## Lambda関数のログを取得、追跡、フィルタリングする

トラブルシューティングを簡素化するために、SAM CLIには`sam logs`というコマンドがあります。このコマンドを使用すると、デプロイされたLambda関数が生成したログをコマンドラインから取得できます。このコマンドは、ターミナルにログを出力するだけでなく、バグを素早く見つけるための便利な機能を備えています。

`注意`: このコマンドは、SAMを使用してデプロイしたものだけでなく、すべてのAWS Lambda関数で動作します。

```bash
nextjs-lambda-sam$ sam logs -n NextjsFunction --stack-name nextjs-lambda-sam --tail
```

Lambda関数のログフィルタリングに関する詳細や例は、[SAM CLI ドキュメント](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html)をご覧ください。

## クリーンアップ

作成したサンプルアプリケーションを削除するには、AWS CLIを使用します。プロジェクト名をスタック名として使用した場合、以下のコマンドを実行してください。

```bash
aws cloudformation delete-stack --stack-name nextjs-lambda-sam
```

## リソース

SAM仕様、SAM CLI、およびサーバーレスアプリケーションの概念については、[AWS SAM 開発者ガイド](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)をご覧ください。

次に、AWS Serverless Application Repositoryを使用して、Hello Worldのサンプルを超えた実用的なアプリケーションをデプロイし、アプリケーションの開発方法を学ぶことができます：[AWS Serverless Application Repository メインページ](https://aws.amazon.com/serverless/serverlessrepo/)