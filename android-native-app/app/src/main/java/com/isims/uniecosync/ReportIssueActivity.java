package com.isims.uniecosync;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.isims.uniecosync.network.ApiService;
import com.isims.uniecosync.network.IssueResponse;
import com.isims.uniecosync.network.RetrofitClient;

import java.io.ByteArrayOutputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ReportIssueActivity extends AppCompatActivity {

    private ImageView imagePreview;
    private EditText editDescription;
    private ProgressBar progressBar;
    private Bitmap capturedImageBitmap;

    // Launcher for taking a picture
    private final ActivityResultLauncher<Void> takePictureLauncher = registerForActivityResult(
            new ActivityResultContracts.TakePicturePreview(),
            result -> {
                if (result != null) {
                    capturedImageBitmap = result;
                    imagePreview.setImageBitmap(capturedImageBitmap);
                } else {
                    Toast.makeText(this, "Image capture cancelled", Toast.LENGTH_SHORT).show();
                }
            }
    );

    // Launcher for requesting camera permission
    private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new ActivityResultContracts.RequestPermission(),
            isGranted -> {
                if (isGranted) {
                    takePictureLauncher.launch(null);
                } else {
                    Toast.makeText(this, "Camera permission required", Toast.LENGTH_SHORT).show();
                }
            }
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report_issue);

        imagePreview = findViewById(R.id.image_preview);
        editDescription = findViewById(R.id.edit_description);
        progressBar = findViewById(R.id.progress_bar);

        Button btnCaptureImage = findViewById(R.id.btn_capture_image);
        Button btnSubmitReport = findViewById(R.id.btn_submit_report);

        btnCaptureImage.setOnClickListener(v -> checkCameraPermissionAndLaunch());

        btnSubmitReport.setOnClickListener(v -> submitReport());
    }

    private void checkCameraPermissionAndLaunch() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            takePictureLauncher.launch(null);
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void submitReport() {
        String description = editDescription.getText().toString().trim();

        if (capturedImageBitmap == null) {
            Toast.makeText(this, "Please capture an image first", Toast.LENGTH_SHORT).show();
            return;
        }

        if (description.isEmpty()) {
            Toast.makeText(this, "Please enter a description", Toast.LENGTH_SHORT).show();
            return;
        }

        // Convert Bitmap to byte array
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        capturedImageBitmap.compress(Bitmap.CompressFormat.JPEG, 80, stream);
        byte[] byteArray = stream.toByteArray();

        // Create RequestBody and MultipartBody.Part for image
        RequestBody reqFile = RequestBody.create(MediaType.parse("image/jpeg"), byteArray);
        MultipartBody.Part imagePart = MultipartBody.Part.createFormData("image", "issue_report.jpg", reqFile);

        // Create RequestBody for text fields
        RequestBody descPart = RequestBody.create(MediaType.parse("text/plain"), description);
        RequestBody studentIdPart = RequestBody.create(MediaType.parse("text/plain"), "123");

        progressBar.setVisibility(View.VISIBLE);

        ApiService apiService = RetrofitClient.getApiService();
        Call<IssueResponse> call = apiService.reportIssue(imagePart, descPart, studentIdPart);
        call.enqueue(new Callback<IssueResponse>() {
            @Override
            public void onResponse(Call<IssueResponse> call, Response<IssueResponse> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    IssueResponse res = response.body();
                    String msg = "Success! Category: " + res.getAiCategory() +
                            "\nPoints: " + res.getEcoPointsAwarded();
                    Toast.makeText(ReportIssueActivity.this, msg, Toast.LENGTH_LONG).show();

                    // Clear form on success
                    capturedImageBitmap = null;
                    imagePreview.setImageDrawable(null);
                    editDescription.setText("");
                } else {
                    Toast.makeText(ReportIssueActivity.this, "Server error: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<IssueResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ReportIssueActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}
